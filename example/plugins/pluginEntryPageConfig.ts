import type { RsbuildPlugin } from '@lynx-js/rspeedy';

type EntryPageConfig = Record<string, Record<string, unknown>>;

interface BeforeEncodeArgs {
  encodeData: { sourceContent: { config: Record<string, unknown> } };
  // template-webpack-plugin 0.10 은 entryNames, 이후 버전은 chunkGroups 로 엔트리를 넘겨요
  entryNames?: string[];
  chunkGroups?: { name?: string }[];
}
interface LynxTemplatePluginLike {
  getLynxTemplatePluginHooks(compilation: unknown): {
    beforeEncode: {
      tap(name: string, fn: (args: BeforeEncodeArgs) => BeforeEncodeArgs): void;
    };
  };
}
interface CompilerLike {
  hooks: {
    thisCompilation: { tap(name: string, fn: (c: unknown) => void): void };
  };
}

const PLUGIN_NAME = 'lynx-console:entry-page-config';

/**
 * 특정 엔트리에만 Lynx 페이지 설정을 더해요.
 * enableFetchAPIStandardStreaming 처럼 켜면 그 페이지의 모든 fetch 경로가 바뀌는 설정은
 * 필요한 페이지에만 넣어야 다른 페이지가 영향을 받지 않아요.
 */
export const pluginEntryPageConfig = (
  entryConfigs: EntryPageConfig,
): RsbuildPlugin => ({
  name: PLUGIN_NAME,
  setup(api) {
    api.modifyBundlerChain((chain) => {
      const exposed = api.useExposed<{
        LynxTemplatePlugin: LynxTemplatePluginLike;
      }>(Symbol.for('LynxTemplatePlugin'));
      if (!exposed) return;
      const { LynxTemplatePlugin } = exposed;

      chain.plugin(PLUGIN_NAME).use(
        class {
          apply(compiler: CompilerLike) {
            compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
              LynxTemplatePlugin.getLynxTemplatePluginHooks(
                compilation,
              ).beforeEncode.tap(PLUGIN_NAME, (args) => {
                const names =
                  args.entryNames ??
                  args.chunkGroups?.map((group) => group.name) ??
                  [];
                for (const name of names) {
                  const extra = name ? entryConfigs[name] : undefined;
                  if (!extra) continue;
                  args.encodeData.sourceContent.config = {
                    ...args.encodeData.sourceContent.config,
                    ...extra,
                  };
                }
                return args;
              });
            });
          }
        },
      );
    });
  },
});
