import { ParsedFile, decodeInstagramText } from './zipParser';
import {
  InstagramData,
  MessageStats,
  LikeStats,
  ContentStats,
  ConnectionStats,
  SearchStats,
  LoginStats,
  TopContact,
  PersonalityInsight,
  Message,
  Conversation,
} from '@/types/instagram';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getYear(timestamp: number): number {
  // Handle both seconds and milliseconds timestamps
  const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
  return new Date(ms).getFullYear();
}

function getMonthKey(timestamp: number): string {
  const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
  const d = new Date(ms);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getMonthKeyForYear(timestamp: number, year: number): string | null {
  const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
  const d = new Date(ms);
  if (d.getFullYear() !== year) return null;
  return MONTHS[d.getMonth()];
}

function getHour(timestamp: number): number {
  const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
  return new Date(ms).getHours();
}

function getDayKey(timestamp: number): string {
  const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
  return new Date(ms).toISOString().split('T')[0];
}

export function analyzeInstagramData(
  files: ParsedFile[],
  selectedYear: number
): InstagramData {
  // Collect all available years
  const allTimestamps: number[] = [];
  
  files.forEach(file => {
    extractTimestamps(file.content, allTimestamps);
  });

  const availableYears = [...new Set(allTimestamps.map(getYear))].sort((a, b) => b - a);
  
  if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
    selectedYear = availableYears[0];
  }

  // Process each category
  const messageFiles = files.filter(f => f.category === 'messages');
  const likeFiles = files.filter(f => f.category === 'likes');
  const postFiles = files.filter(f => f.category === 'posts');
  const reelFiles = files.filter(f => f.category === 'reels');
  const storyFiles = files.filter(f => f.category === 'stories');
  const followerFiles = files.filter(f => f.category === 'followers');
  const followingFiles = files.filter(f => f.category === 'following');
  const searchFiles = files.filter(f => f.category === 'searches');
  const loginFiles = files.filter(f => f.category === 'logins');
  const commentFiles = files.filter(f => f.category === 'comments');
  const savedFiles = files.filter(f => f.category === 'saved');
  const adFiles = files.filter(f => f.category === 'ads');

  const messages = processMessages(messageFiles, selectedYear);
  const likes = processLikes(likeFiles, selectedYear);
  const content = processContent(postFiles, reelFiles, storyFiles, selectedYear);
  const connections = processConnections(followerFiles, followingFiles, selectedYear);
  const searches = processSearches(searchFiles, selectedYear);
  const logins = processLogins(loginFiles, selectedYear);
  const comments = processComments(commentFiles, selectedYear);
  const saves = processSaves(savedFiles, selectedYear);
  const ads = processAds(adFiles, selectedYear);

  const personality = generatePersonality(messages, likes, content, searches);

  return {
    messages,
    likes,
    content,
    connections,
    searches,
    logins,
    comments,
    saves,
    ads,
    personality,
    availableYears,
    selectedYear,
  };
}

function extractTimestamps(obj: any, timestamps: number[]): void {
  if (!obj) return;
  
  if (typeof obj === 'object') {
    if (obj.timestamp_ms) timestamps.push(obj.timestamp_ms);
    if (obj.timestamp) timestamps.push(obj.timestamp);
    if (obj.creation_timestamp) timestamps.push(obj.creation_timestamp);
    
    if (Array.isArray(obj)) {
      obj.forEach(item => extractTimestamps(item, timestamps));
    } else {
      Object.values(obj).forEach(val => extractTimestamps(val, timestamps));
    }
  }
}

function processMessages(files: ParsedFile[], year: number): MessageStats {
  const conversations: Map<string, { messages: Message[]; participants: string[] }> = new Map();
  let username = '';

  // First pass: Aggregate all conversations and collect sender data
  const allSenderCounts: Record<string, number> = {};
  const conversationCount: Record<string, number> = {}; // How many different convos each person appears in
  
  files.forEach(file => {
    const data = file.content as Conversation;
    if (!data.participants || !data.messages) return;

    const participants = data.participants.map(p => decodeInstagramText(p.name));
    const key = participants.sort().join('|');
    
    // Track participants across conversations
    participants.forEach(p => {
      conversationCount[p] = (conversationCount[p] || 0) + 1;
    });

    // Create a COPY of messages to avoid mutating the original data
    const messagesCopy = [...data.messages];
    
    if (conversations.has(key)) {
      conversations.get(key)!.messages.push(...messagesCopy);
    } else {
      conversations.set(key, { messages: messagesCopy, participants });
    }
    
    // Count senders
    data.messages.forEach(m => {
      const sender = decodeInstagramText(m.sender_name || '');
      if (sender) {
        allSenderCounts[sender] = (allSenderCounts[sender] || 0) + 1;
      }
    });
  });

  // Detect username: the person who appears in the MOST conversations is the owner
  // If tie, use the most frequent sender
  const sortedByConvos = Object.entries(conversationCount).sort((a, b) => b[1] - a[1]);
  if (sortedByConvos.length > 0) {
    // The owner appears in ALL or most conversations
    const maxConvos = sortedByConvos[0][1];
    const topParticipants = sortedByConvos.filter(([_, count]) => count === maxConvos);
    
    if (topParticipants.length === 1) {
      username = topParticipants[0][0];
    } else {
      // Tie-breaker: most messages sent overall
      const sortedSenders = Object.entries(allSenderCounts).sort((a, b) => b[1] - a[1]);
      username = sortedSenders[0]?.[0] || sortedByConvos[0][0];
    }
  }

  // Calculate stats
  let totalSent = 0;
  let totalReceived = 0;
  const messagesPerMonth: Record<string, number> = {};
  const messagesPerDay: Record<string, number> = {};
  const messagesPerHour: Record<number, number> = {};
  let firstMessage: { date: Date; content: string; with: string } | null = null;
  let lastMessage: { date: Date; content: string; with: string } | null = null;

  const contactStats: Map<string, { 
    sent: number; 
    received: number; 
    firstTs: number;
    overallFirstTs: number; // Track actual first interaction ever (not filtered by year)
    monthCounts: Record<string, number>;
    hourCounts: Record<number, number>;
    dayCounts: Record<string, number>;
    words: Record<string, number>;
    emojis: Record<string, number>;
    mediaStats: { photos: number; videos: number; reels: number; links: number; reelsSent: number; reelsReceived: number };
    firstMessage?: { date: Date; content: string };
    lastMessage?: { date: Date; content: string };
  }> = new Map();

  // First pass: collect ALL first interactions (not filtered by year)
  files.forEach(file => {
    const data = file.content as Conversation;
    if (!data.participants || !data.messages) return;
    
    const participants = data.participants.map(p => decodeInstagramText(p.name));
    const otherParticipants = participants.filter(p => p !== username);
    const contactName = otherParticipants.join(', ') || 'Unknown';
    
    data.messages.forEach(msg => {
      const ts = msg.timestamp_ms;
      if (!ts) return;
      
      if (!contactStats.has(contactName)) {
        contactStats.set(contactName, { 
          sent: 0, 
          received: 0, 
          firstTs: Infinity,
          overallFirstTs: ts,
          monthCounts: {},
          hourCounts: {},
          dayCounts: {},
          words: {},
          emojis: {},
          mediaStats: { photos: 0, videos: 0, reels: 0, links: 0, reelsSent: 0, reelsReceived: 0 },
        });
      }
      const stats = contactStats.get(contactName)!;
      if (ts < stats.overallFirstTs) stats.overallFirstTs = ts;
    });
  });

  // Emoji regex pattern
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1FA00}-\u{1FAFF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]/gu;

  // Common words to filter out
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though', 'after', 'before', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'been', 'being', 'having', 'doing', 'would', 'could', 'should', 'might', 'must', 'let', 'us', 'up', 'out', 'about', 'over', 'down', 'off', 'now', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'now', 'also', 'like', 'oh', 'ok', 'okay', 'yeah', 'yes', 'no', 'hi', 'hey', 'hello', 'bye', 'lol', 'haha', 'hahaha', 'u', 'ur', 'im', 'dont', 'didnt', 'cant', 'wont', 'ive', 'youre', 'theyre', 'thats', 'whats', 'its', 'got', 'get', 'go', 'going', 'come', 'coming', 'know', 'think', 'want', 'see', 'look', 'make', 'take', 'give', 'good', 'great', 'well', 'back', 'way', 'even', 'new', 'first', 'last', 'long', 'little', 'own', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able']);

  conversations.forEach((conv, key) => {
    const otherParticipants = conv.participants.filter(p => p !== username);
    const contactName = otherParticipants.join(', ') || 'Unknown';

    conv.messages.forEach(msg => {
      const ts = msg.timestamp_ms;
      if (!ts) return;

      const msgYear = getYear(ts);
      if (msgYear !== year) return;

      const sender = decodeInstagramText(msg.sender_name || '');
      const isSent = sender === username;
      const monthKey = getMonthKeyForYear(ts, year);
      const dayKey = getDayKey(ts);
      const hour = getHour(ts);

      if (isSent) {
        totalSent++;
      } else {
        totalReceived++;
      }

      if (monthKey) {
        messagesPerMonth[monthKey] = (messagesPerMonth[monthKey] || 0) + 1;
      }
      messagesPerDay[dayKey] = (messagesPerDay[dayKey] || 0) + 1;
      messagesPerHour[hour] = (messagesPerHour[hour] || 0) + 1;

      // Track first/last messages
      const msgDate = new Date(ts);
      const content = msg.content ? decodeInstagramText(msg.content) : '[Media]';
      
      if (!firstMessage || ts < firstMessage.date.getTime()) {
        firstMessage = { date: msgDate, content, with: contactName };
      }
      if (!lastMessage || ts > lastMessage.date.getTime()) {
        lastMessage = { date: msgDate, content, with: contactName };
      }

      // Contact stats - update existing entry (already created in first pass)
      if (!contactStats.has(contactName)) {
        contactStats.set(contactName, { 
          sent: 0, 
          received: 0, 
          firstTs: ts,
          overallFirstTs: ts,
          monthCounts: {},
          hourCounts: {},
          dayCounts: {},
          words: {},
          emojis: {},
          mediaStats: { photos: 0, videos: 0, reels: 0, links: 0, reelsSent: 0, reelsReceived: 0 },
        });
      }
      const stats = contactStats.get(contactName)!;
      if (isSent) stats.sent++;
      else stats.received++;
      if (ts < stats.firstTs) stats.firstTs = ts;
      if (monthKey) {
        stats.monthCounts[monthKey] = (stats.monthCounts[monthKey] || 0) + 1;
      }
      stats.hourCounts[hour] = (stats.hourCounts[hour] || 0) + 1;
      stats.dayCounts[dayKey] = (stats.dayCounts[dayKey] || 0) + 1;

      // Track first/last message per contact (for selected year)
      if (!stats.firstMessage || ts < stats.firstMessage.date.getTime()) {
        stats.firstMessage = { date: msgDate, content };
      }
      if (!stats.lastMessage || ts > stats.lastMessage.date.getTime()) {
        stats.lastMessage = { date: msgDate, content };
      }

      // Track media stats (differentiate sender)
      if (isSent) {
        if (msg.photos && msg.photos.length > 0) {
          stats.mediaStats.photos += msg.photos.length;
        }
        if (msg.videos && msg.videos.length > 0) {
          stats.mediaStats.videos += msg.videos.length;
        }
        if (msg.share?.link) {
          if (msg.share.link.includes('reel') || msg.share.link.includes('/reel/')) {
            stats.mediaStats.reels++;
            stats.mediaStats.reelsSent++;
          } else {
            stats.mediaStats.links++;
          }
        }
      } else {
        // Received media - only track reels comparison
        if (msg.share?.link) {
          if (msg.share.link.includes('reel') || msg.share.link.includes('/reel/')) {
            stats.mediaStats.reels++;
            stats.mediaStats.reelsReceived++;
          }
        }
      }

      // Word and emoji frequency (only from user's sent messages to this contact)
      if (isSent && msg.content) {
        const decodedContent = decodeInstagramText(msg.content);
        
        // Extract words
        const words = decodedContent
          .toLowerCase()
          .replace(/[^a-z\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 2 && !stopWords.has(w));
        
        words.forEach(word => {
          stats.words[word] = (stats.words[word] || 0) + 1;
        });

        // Extract emojis
        const emojis = decodedContent.match(emojiRegex) || [];
        emojis.forEach(emoji => {
          stats.emojis[emoji] = (stats.emojis[emoji] || 0) + 1;
        });
      }
    });
  });

  // Calculate streak per contact
  const calculateStreak = (dayCounts: Record<string, number>): number => {
    const sortedDays = Object.keys(dayCounts).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let prevDate: Date | null = null;

    sortedDays.forEach(day => {
      const currentDate = new Date(day);
      if (prevDate) {
        const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      prevDate = currentDate;
    });
    return Math.max(longestStreak, currentStreak);
  };

  // Calculate top contacts with extended stats
  const totalMessages = totalSent + totalReceived;
  const topContacts: TopContact[] = Array.from(contactStats.entries())
    .map(([name, stats]) => {
      const total = stats.sent + stats.received;
      const mostActiveMonth = Object.entries(stats.monthCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      
      const topWords = Object.entries(stats.words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      const topEmojis = Object.entries(stats.emojis)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([emoji, count]) => ({ emoji, count }));
      
      return {
        username: name,
        totalMessages: total,
        sent: stats.sent,
        received: stats.received,
        percentage: totalMessages > 0 ? (total / totalMessages) * 100 : 0,
        firstInteraction: new Date(stats.overallFirstTs), // Use overall first, not year-filtered
        mostActiveMonth,
        messagesPerMonth: stats.monthCounts,
        messagesPerHour: stats.hourCounts,
        topWords,
        topEmojis,
        mediaStats: stats.mediaStats,
        longestStreak: calculateStreak(stats.dayCounts),
        firstMessage: stats.firstMessage,
        lastMessage: stats.lastMessage,
      };
    })
    .sort((a, b) => b.totalMessages - a.totalMessages)
    .slice(0, 5);

  // Calculate streak
  const sortedDays = Object.keys(messagesPerDay).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let prevDate: Date | null = null;

  sortedDays.forEach(day => {
    const currentDate = new Date(day);
    if (prevDate) {
      const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    prevDate = currentDate;
  });
  longestStreak = Math.max(longestStreak, currentStreak);

  // Find longest conversation
  let longestConversation = { name: 'N/A', count: 0 };
  contactStats.forEach((stats, name) => {
    const total = stats.sent + stats.received;
    if (total > longestConversation.count) {
      longestConversation = { name, count: total };
    }
  });

  const daysWithMessages = Object.keys(messagesPerDay).length;
  const avgMessagesPerDay = daysWithMessages > 0 ? totalMessages / daysWithMessages : 0;

  return {
    totalSent,
    totalReceived,
    totalConversations: conversations.size,
    messagesPerMonth,
    messagesPerDay,
    messagesPerHour,
    avgMessagesPerDay,
    longestStreak,
    longestConversation,
    firstMessage,
    lastMessage,
    topContacts,
  };
}

function processLikes(files: ParsedFile[], year: number): LikeStats {
  let totalGiven = 0;
  const likesPerMonth: Record<string, number> = {};
  const likesPerHour: Record<number, number> = {};
  const accountCounts: Record<string, number> = {};
  const mediaTypeCounts: Record<string, number> = { post: 0, reel: 0, story: 0 };

  files.forEach(file => {
    const data = file.content;
    
    // Handle different like formats
    let likes: any[] = [];
    
    if (data.likes_media_likes) {
      likes = data.likes_media_likes;
    } else if (Array.isArray(data)) {
      likes = data;
    } else if (data.story_likes) {
      likes = data.story_likes;
      likes.forEach(() => mediaTypeCounts.story++);
    }

    likes.forEach(like => {
      let timestamp: number | undefined;
      let account: string | undefined;

      // Try different timestamp locations
      if (like.string_list_data?.[0]?.timestamp) {
        timestamp = like.string_list_data[0].timestamp;
        account = like.title || like.string_list_data[0].value;
      } else if (like.timestamp) {
        timestamp = like.timestamp;
        account = like.title;
      }

      if (!timestamp) return;
      if (getYear(timestamp) !== year) return;

      totalGiven++;
      
      const monthKey = getMonthKeyForYear(timestamp, year);
      if (monthKey) {
        likesPerMonth[monthKey] = (likesPerMonth[monthKey] || 0) + 1;
      }
      
      const hour = getHour(timestamp);
      likesPerHour[hour] = (likesPerHour[hour] || 0) + 1;

      if (account) {
        const decoded = decodeInstagramText(account);
        accountCounts[decoded] = (accountCounts[decoded] || 0) + 1;
      }

      // Guess media type from path
      const path = file.path.toLowerCase();
      if (path.includes('reel')) mediaTypeCounts.reel++;
      else if (path.includes('story')) mediaTypeCounts.story++;
      else mediaTypeCounts.post++;
    });
  });

  const topLikedAccounts = Object.entries(accountCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([account, count]) => ({ account, count }));

  return {
    totalGiven,
    likesPerMonth,
    likesPerHour,
    topLikedAccounts,
    mediaTypeCounts,
  };
}

function processContent(
  postFiles: ParsedFile[],
  reelFiles: ParsedFile[],
  storyFiles: ParsedFile[],
  year: number
): ContentStats {
  const reelsPerMonth: Record<string, number> = {};
  const postsPerMonth: Record<string, number> = {};
  const storiesPerMonth: Record<string, number> = {};
  let reelTotal = 0;
  let postTotal = 0;
  let storyTotal = 0;

  // Process posts
  postFiles.forEach(file => {
    const data = file.content;
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data.photos) {
      items = data.photos;
    } else if (data.videos) {
      items = data.videos;
    }

    items.forEach(item => {
      const ts = item.creation_timestamp || item.media?.[0]?.creation_timestamp;
      if (!ts || getYear(ts) !== year) return;
      
      postTotal++;
      const monthKey = getMonthKeyForYear(ts, year);
      if (monthKey) {
        postsPerMonth[monthKey] = (postsPerMonth[monthKey] || 0) + 1;
      }
    });
  });

  // Process reels
  reelFiles.forEach(file => {
    const data = file.content;
    let items = data.ig_reels_media || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.creation_timestamp || item.media?.[0]?.creation_timestamp;
      if (!ts || getYear(ts) !== year) return;
      
      reelTotal++;
      const monthKey = getMonthKeyForYear(ts, year);
      if (monthKey) {
        reelsPerMonth[monthKey] = (reelsPerMonth[monthKey] || 0) + 1;
      }
    });
  });

  // Process stories
  storyFiles.forEach(file => {
    const data = file.content;
    let items = data.ig_stories || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.creation_timestamp;
      if (!ts || getYear(ts) !== year) return;
      
      storyTotal++;
      const monthKey = getMonthKeyForYear(ts, year);
      if (monthKey) {
        storiesPerMonth[monthKey] = (storiesPerMonth[monthKey] || 0) + 1;
      }
    });
  });

  const getMostActiveMonth = (perMonth: Record<string, number>) => {
    const sorted = Object.entries(perMonth).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
  };

  return {
    reels: { total: reelTotal, perMonth: reelsPerMonth },
    posts: { total: postTotal, perMonth: postsPerMonth, mostActiveMonth: getMostActiveMonth(postsPerMonth) },
    stories: { total: storyTotal, perMonth: storiesPerMonth, peakMonth: getMostActiveMonth(storiesPerMonth) },
  };
}

function processConnections(
  followerFiles: ParsedFile[],
  followingFiles: ParsedFile[],
  year: number
): ConnectionStats {
  let followers = 0;
  let following = 0;
  let newFollowers = 0;

  followerFiles.forEach(file => {
    const data = file.content;
    let items = data.relationships_followers || (Array.isArray(data) ? data : []);
    
    items.forEach((item: any) => {
      followers++;
      const ts = item.string_list_data?.[0]?.timestamp;
      if (ts && getYear(ts) === year) {
        newFollowers++;
      }
    });
  });

  followingFiles.forEach(file => {
    const data = file.content;
    let items = data.relationships_following || (Array.isArray(data) ? data : []);
    following += items.length || 0;
  });

  return {
    followers,
    following,
    newFollowers,
    unfollowers: 0, // Can't determine from export
    netGrowth: newFollowers,
    mutuals: Math.min(followers, following), // Approximation
  };
}

function processSearches(files: ParsedFile[], year: number): SearchStats {
  let totalSearches = 0;
  const searchCounts: Record<string, number> = {};

  files.forEach(file => {
    const data = file.content;
    let items = data.searches_user || data.searches_keyword || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.string_map_data?.Time?.timestamp || item.timestamp;
      if (ts && getYear(ts) !== year) return;

      totalSearches++;
      const query = item.string_map_data?.Search?.value || item.title;
      if (query) {
        const decoded = decodeInstagramText(query);
        searchCounts[decoded] = (searchCounts[decoded] || 0) + 1;
      }
    });
  });

  const topSearchedAccounts = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([account, count]) => ({ account, count }));

  // Determine search personality
  let searchPersonality = 'Explorer 🔍';
  if (topSearchedAccounts.length > 0) {
    const topCount = topSearchedAccounts[0].count;
    if (topCount > totalSearches * 0.3) {
      searchPersonality = 'Loyal Follower 💝';
    } else if (topSearchedAccounts.length >= 5) {
      searchPersonality = 'Curious Mind 🧠';
    }
  }

  return {
    totalSearches,
    topSearchedAccounts,
    searchPersonality,
  };
}

function processLogins(files: ParsedFile[], year: number): LoginStats {
  let totalLogins = 0;
  const deviceCounts: Record<string, number> = {};
  const locations: Set<string> = new Set();

  files.forEach(file => {
    const data = file.content;
    let items = data.account_history_login_history || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.string_map_data?.Time?.timestamp || item.timestamp;
      if (ts && getYear(ts) !== year) return;

      totalLogins++;
      
      const userAgent = item.string_map_data?.["User Agent"]?.value;
      if (userAgent) {
        // Extract device type from user agent
        let device = 'Unknown';
        if (userAgent.includes('iPhone')) device = 'iPhone';
        else if (userAgent.includes('Android')) device = 'Android';
        else if (userAgent.includes('Windows')) device = 'Windows PC';
        else if (userAgent.includes('Mac')) device = 'Mac';
        else if (userAgent.includes('iPad')) device = 'iPad';
        
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      }

      const ip = item.string_map_data?.["IP Address"]?.value;
      if (ip) {
        locations.add(ip.split('.').slice(0, 2).join('.') + '.x.x');
      }
    });
  });

  const devices = Object.keys(deviceCounts);
  const mostUsedDevice = Object.entries(deviceCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

  return {
    totalLogins,
    devices,
    mostUsedDevice,
    locations: Array.from(locations),
  };
}

function processComments(files: ParsedFile[], year: number): { total: number; perMonth: Record<string, number> } {
  let total = 0;
  const perMonth: Record<string, number> = {};

  files.forEach(file => {
    const data = file.content;
    let items = data.comments_media_comments || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.string_list_data?.[0]?.timestamp || item.timestamp;
      if (!ts || getYear(ts) !== year) return;

      total++;
      const monthKey = getMonthKeyForYear(ts, year);
      if (monthKey) {
        perMonth[monthKey] = (perMonth[monthKey] || 0) + 1;
      }
    });
  });

  return { total, perMonth };
}

function processSaves(files: ParsedFile[], year: number): { total: number } {
  let total = 0;

  files.forEach(file => {
    const data = file.content;
    let items = data.saved_saved_media || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.string_list_data?.[0]?.timestamp || item.timestamp;
      if (ts && getYear(ts) !== year) return;
      total++;
    });
  });

  return { total };
}

function processAds(files: ParsedFile[], year: number): { viewed: number; clicked: number; categories: string[] } {
  let viewed = 0;
  let clicked = 0;
  const categories: Set<string> = new Set();

  files.forEach(file => {
    const data = file.content;
    const path = file.path.toLowerCase();
    
    let items = data.ads_viewed || data.ads_clicked || data.ads_interests || (Array.isArray(data) ? data : []);

    items.forEach((item: any) => {
      const ts = item.string_list_data?.[0]?.timestamp || item.timestamp;
      if (ts && getYear(ts) !== year) return;

      if (path.includes('click')) {
        clicked++;
      } else {
        viewed++;
      }

      const category = item.title || item.string_list_data?.[0]?.value;
      if (category) {
        categories.add(decodeInstagramText(category));
      }
    });
  });

  return { viewed, clicked, categories: Array.from(categories).slice(0, 10) };
}

function generatePersonality(
  messages: MessageStats,
  likes: LikeStats,
  content: ContentStats,
  searches: SearchStats
): PersonalityInsight[] {
  const insights: PersonalityInsight[] = [];

  // Night Scroller
  const nightHours = [22, 23, 0, 1, 2, 3, 4];
  const nightMessages = nightHours.reduce((sum, h) => sum + (messages.messagesPerHour[h] || 0), 0);
  const totalHourlyMessages = Object.values(messages.messagesPerHour).reduce((a, b) => a + b, 0);
  if (totalHourlyMessages > 0 && nightMessages / totalHourlyMessages > 0.3) {
    insights.push({
      tag: 'Night Scroller',
      emoji: '🌙',
      description: 'Most active during the night hours',
      score: nightMessages / totalHourlyMessages,
    });
  }

  // Reel Addict
  if (content.reels.total > 20) {
    insights.push({
      tag: 'Reel Addict',
      emoji: '🎥',
      description: `Posted ${content.reels.total} reels this year`,
      score: Math.min(content.reels.total / 50, 1),
    });
  }

  // Ghost Poster
  if (content.posts.total < 5 && messages.totalSent > 100) {
    insights.push({
      tag: 'Ghost Poster',
      emoji: '👻',
      description: 'Barely posts but always online',
      score: 0.8,
    });
  }

  // Social Builder
  if (messages.topContacts.length >= 5 && messages.totalSent > 500) {
    insights.push({
      tag: 'Social Builder',
      emoji: '🧱',
      description: 'Maintains many active conversations',
      score: Math.min(messages.totalSent / 1000, 1),
    });
  }

  // Silent Observer
  if (likes.totalGiven > messages.totalSent * 2) {
    insights.push({
      tag: 'Silent Observer',
      emoji: '👀',
      description: 'Likes more than talks',
      score: Math.min(likes.totalGiven / 500, 1),
    });
  }

  // Story Addict
  if (content.stories.total > 100) {
    insights.push({
      tag: 'Story Addict',
      emoji: '📖',
      description: `${content.stories.total} stories shared`,
      score: Math.min(content.stories.total / 200, 1),
    });
  }

  // Loyal Friend
  if (messages.topContacts.length > 0 && messages.topContacts[0].percentage > 30) {
    insights.push({
      tag: 'Loyal Friend',
      emoji: '💕',
      description: 'Has a bestie they message constantly',
      score: messages.topContacts[0].percentage / 100,
    });
  }

  // Search Explorer
  if (searches.totalSearches > 100) {
    insights.push({
      tag: 'Explorer',
      emoji: '🔍',
      description: 'Always discovering new accounts',
      score: Math.min(searches.totalSearches / 200, 1),
    });
  }

  // Sort by score and return top 4
  return insights.sort((a, b) => b.score - a.score).slice(0, 4);
}
