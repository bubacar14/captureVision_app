declare module 'i18n' {
  interface I18n {
    common: {
      cancel: string;
      save: string;
      create: string;
      edit: string;
      delete: string;
      back: string;
      loading: string;
      error: string;
      success: string;
    };
    [key: string]: any;
  }

  const fr: I18n;
  export { fr };
}
