export function provideProfileArticlesType(type: string) {
  return { provide: 'PROFILE_ARTICLES_TYPE', useValue: type };
}
