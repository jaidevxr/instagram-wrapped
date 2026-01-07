import JSZip from 'jszip';

export interface ParsedFile {
  path: string;
  content: any;
  category: string;
}

// Content-based detection patterns
const DETECTION_PATTERNS = {
  messages: (data: any) => {
    return data?.participants && Array.isArray(data?.messages);
  },
  likes: (data: any) => {
    return (
      data?.likes_media_likes ||
      data?.story_likes ||
      (Array.isArray(data) && data[0]?.string_list_data) ||
      data?.impressions_history_posts_seen
    );
  },
  comments: (data: any) => {
    return (
      data?.comments_media_comments ||
      (Array.isArray(data) && data[0]?.string_list_data?.[0]?.value?.includes('@'))
    );
  },
  posts: (data: any) => {
    return (
      data?.photos ||
      data?.videos ||
      (Array.isArray(data) && data[0]?.media && data[0]?.creation_timestamp)
    );
  },
  reels: (data: any) => {
    return data?.ig_reels_media;
  },
  stories: (data: any) => {
    return data?.ig_stories || (Array.isArray(data) && data[0]?.uri?.includes('story'));
  },
  followers: (data: any) => {
    return (
      data?.relationships_followers ||
      (Array.isArray(data) && data[0]?.string_list_data && !data[0]?.title)
    );
  },
  following: (data: any) => {
    return data?.relationships_following;
  },
  searches: (data: any) => {
    return (
      data?.searches_user ||
      data?.searches_keyword ||
      (Array.isArray(data) && data[0]?.string_map_data?.Search)
    );
  },
  logins: (data: any) => {
    return (
      data?.account_history_login_history ||
      (Array.isArray(data) && data[0]?.string_map_data?.["IP Address"])
    );
  },
  ads: (data: any) => {
    return (
      data?.ads_interests ||
      data?.ads_viewed ||
      data?.ads_clicked ||
      (Array.isArray(data) && data[0]?.title?.toLowerCase().includes('ad'))
    );
  },
  saved: (data: any) => {
    return (
      data?.saved_saved_media ||
      data?.saved_saved_collections ||
      (Array.isArray(data) && data[0]?.string_list_data?.[0]?.href)
    );
  },
  profile: (data: any) => {
    return data?.profile_user || data?.username || data?.biography;
  },
};

export async function parseZipFile(file: File): Promise<{
  files: ParsedFile[];
  isHtmlExport: boolean;
}> {
  const zip = await JSZip.loadAsync(file);
  const files: ParsedFile[] = [];
  let hasHtmlFiles = false;
  let hasJsonFiles = false;

  const entries = Object.entries(zip.files);

  for (const [path, zipEntry] of entries) {
    if (zipEntry.dir) continue;

    const extension = path.split('.').pop()?.toLowerCase();

    // Skip media and other non-data files
    if (['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp', 'txt', 'webm'].includes(extension || '')) {
      continue;
    }

    if (extension === 'html') {
      hasHtmlFiles = true;
      continue;
    }

    if (extension === 'json') {
      hasJsonFiles = true;
      try {
        const content = await zipEntry.async('string');
        const parsed = JSON.parse(content);
        
        // Classify the file based on content
        const category = classifyContent(parsed, path);
        
        if (category !== 'unknown') {
          files.push({
            path,
            content: parsed,
            category,
          });
        }
      } catch (e) {
        console.warn(`Failed to parse JSON: ${path}`, e);
      }
    }
  }

  return {
    files,
    isHtmlExport: hasHtmlFiles && !hasJsonFiles,
  };
}

function classifyContent(data: any, path: string): string {
  // Try content-based detection first
  for (const [category, detector] of Object.entries(DETECTION_PATTERNS)) {
    try {
      if (detector(data)) {
        return category;
      }
    } catch {
      continue;
    }
  }

  // Fallback to path-based hints
  const pathLower = path.toLowerCase();
  
  if (pathLower.includes('message') || pathLower.includes('inbox')) return 'messages';
  if (pathLower.includes('like')) return 'likes';
  if (pathLower.includes('comment')) return 'comments';
  if (pathLower.includes('post') || pathLower.includes('content')) return 'posts';
  if (pathLower.includes('reel')) return 'reels';
  if (pathLower.includes('stor')) return 'stories';
  if (pathLower.includes('follower')) return 'followers';
  if (pathLower.includes('following')) return 'following';
  if (pathLower.includes('search')) return 'searches';
  if (pathLower.includes('login') || pathLower.includes('device')) return 'logins';
  if (pathLower.includes('ad')) return 'ads';
  if (pathLower.includes('save')) return 'saved';
  if (pathLower.includes('profile')) return 'profile';

  return 'unknown';
}

export function decodeInstagramText(text: string): string {
  // Instagram exports text in latin1, need to decode
  try {
    const bytes = new Uint8Array(text.split('').map(c => c.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return text;
  }
}
