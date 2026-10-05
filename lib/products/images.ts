// One contract for admin validation, catalog mapping and next/image.
export function imageRemotePatterns(base = process.env.NEXT_PUBLIC_SUPABASE_URL) {
 try {
  const url = new URL(base ?? "");
  if (url.protocol !== "https:" || url.username || url.password || url.port) return [];
  return [{protocol:"https" as const,hostname:url.hostname,port:"",pathname:"/storage/v1/object/public/product-images/**",search:""}];
 } catch { return []; }
}
export function safeImage(value: string | null | undefined): string {
 if (!value || value !== value.trim() || /[\\\\\u0000-\u0020]/.test(value)) return "";
 try {
  const local=value.startsWith("/")&&!value.startsWith("//");
  const url=new URL(value,"https://local.invalid");
  if(url.search||url.hash||url.username||url.password)return "";
  const decoded=decodeURIComponent(url.pathname);
  if (!/^[\p{L}\p{N} /_().-]+$/u.test(decoded)) return "";
  if(!/\.(?:jpe?g|png|webp)$/i.test(decoded)||decoded.split("/").some(p=>p==="."||p==="..")||/%2f|%5c|%2e/i.test(value)||decoded.includes("\\"))return "";
  if(local)return value.startsWith("/images/")&&!value.includes("/../")&&!value.includes("/./")?value:"";
  const pattern=imageRemotePatterns()[0];
  return pattern && url.protocol==="https:"&&url.hostname===pattern.hostname&&url.port===pattern.port&&url.pathname.startsWith("/storage/v1/object/public/product-images/")?value:"";
 }catch{return "";}
}
