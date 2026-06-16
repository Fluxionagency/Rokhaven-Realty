export const allPostsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  featured,
  category,
  excerpt,
  author,
  authorRole,
  readTime,
  publishedAt,
  tags,
  "coverImageUrl": coverImage.asset->url
}`;

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  featured,
  category,
  excerpt,
  author,
  authorRole,
  authorBio,
  "authorImageUrl": authorImage.asset->url,
  readTime,
  publishedAt,
  tags,
  body,
  "coverImageUrl": coverImage.asset->url
}`;
