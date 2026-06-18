import slugify from 'slugify';

export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: 'id',
  });
};
