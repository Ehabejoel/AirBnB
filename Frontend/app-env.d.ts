// @ts-ignore
/// <reference types="nativewind/types" />

declare module NodeJS {
  interface Require {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
      mode?: string
    ): {
      keys(): string[];
      <T>(id: string): T;
      resolve(id: string): string;
      id: string;
    };
  }
}
