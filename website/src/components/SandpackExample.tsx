import React, { useMemo, type JSX } from "react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  type SandpackFile,
  type SandpackFiles,
  type SandpackOptions,
  SandpackPreview,
  SandpackProvider,
  type SandpackSetup,
} from "@codesandbox/sandpack-react";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./SandpackExample.module.css";

const TS_CONFIG_PATH = "/tsconfig.json";
const DEFAULT_EDITOR_HEIGHT = 420;

const DECORATOR_TS_CONFIG = {
  compilerOptions: {
    experimentalDecorators: true,
  },
};

type ExampleFile = string | SandpackFile;

type SandpackExampleProps = {
  files: Record<string, ExampleFile>;
  hiddenFiles?: readonly string[];
  visibleFiles?: readonly string[];
  activeFile?: string;
  showRunButton?: boolean;
  showOpenInCodeSandbox?: boolean;
  editorHeight?: number;
  options?: Omit<
    SandpackOptions,
    "visibleFiles" | "activeFile" | "editorHeight"
  >;
  customSetup?: SandpackSetup;
};

const normalizePath = (path: string): string => {
  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
};

const toSandpackFile = (file: ExampleFile): SandpackFile => {
  if (typeof file === "string") {
    return { code: file };
  }

  return file;
};

const parseJson = (value: string): Record<string, unknown> => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall back to a minimal object when the current tsconfig cannot be parsed.
  }

  return {};
};

const buildTsConfig = (existingCode?: string): string => {
  const current = existingCode ? parseJson(existingCode) : {};
  const compilerOptions =
    current.compilerOptions &&
    typeof current.compilerOptions === "object" &&
    !Array.isArray(current.compilerOptions)
      ? { ...(current.compilerOptions as Record<string, unknown>) }
      : {};

  const mergedConfig = {
    ...current,
    ...DECORATOR_TS_CONFIG,
    compilerOptions: {
      ...compilerOptions,
      ...DECORATOR_TS_CONFIG.compilerOptions,
    },
  };

  return `${JSON.stringify(mergedConfig, null, 2)}\n`;
};

const isHidden = (
  path: string,
  file: SandpackFile,
  hiddenFilesSet: ReadonlySet<string>,
): boolean => {
  return Boolean(file.hidden) || hiddenFilesSet.has(path);
};

export const SandpackExample = ({
  files,
  hiddenFiles = [],
  visibleFiles,
  activeFile,
  showRunButton = false,
  showOpenInCodeSandbox = false,
  editorHeight = DEFAULT_EDITOR_HEIGHT,
  options,
  customSetup,
}: SandpackExampleProps): JSX.Element => {
  const { colorMode } = useColorMode();
  const sandpackTheme = colorMode === "dark" ? "dark" : "light";

  const normalizedPaths = useMemo(() => {
    return {
      hidden: new Set(hiddenFiles.map((path) => normalizePath(path))),
      visible: visibleFiles?.map((path) => normalizePath(path)),
      active: activeFile ? normalizePath(activeFile) : undefined,
    };
  }, [activeFile, hiddenFiles, visibleFiles]);

  const normalizedFiles = useMemo<SandpackFiles>(() => {
    const nextFiles: SandpackFiles = {};

    Object.entries(files).forEach(([rawPath, rawFile]) => {
      const path = normalizePath(rawPath);
      const file = toSandpackFile(rawFile);

      nextFiles[path] = normalizedPaths.hidden.has(path)
        ? { ...file, hidden: true }
        : file;
    });

    const existingTsConfig = nextFiles[TS_CONFIG_PATH];
    const existingTsConfigFile =
      typeof existingTsConfig === "string"
        ? { code: existingTsConfig }
        : existingTsConfig;

    nextFiles[TS_CONFIG_PATH] = {
      code: buildTsConfig(existingTsConfigFile?.code),
      hidden: true,
      readOnly: true,
    };

    return nextFiles;
  }, [files, normalizedPaths.hidden]);

  const resolvedVisibleFiles = useMemo(() => {
    if (normalizedPaths.visible && normalizedPaths.visible.length > 0) {
      const explicitVisible = normalizedPaths.visible.filter(
        (path) => !normalizedPaths.hidden.has(path),
      );
      if (explicitVisible.length > 0) {
        return explicitVisible;
      }
    }

    const visible = Object.entries(normalizedFiles)
      .filter(([path, file]) => {
        const normalizedFile = typeof file === "string" ? { code: file } : file;
        return !isHidden(path, normalizedFile, normalizedPaths.hidden);
      })
      .map(([path]) => path);

    if (visible.length > 0) {
      return visible;
    }

    return Object.keys(normalizedFiles).slice(0, 1);
  }, [normalizedFiles, normalizedPaths.hidden, normalizedPaths.visible]);

  const resolvedActiveFile = normalizedPaths.active ?? resolvedVisibleFiles[0];

  return (
    <div className={styles.wrapper}>
      <SandpackProvider
        template="vanilla-ts"
        theme={sandpackTheme}
        files={normalizedFiles}
        customSetup={customSetup}
        options={{
          visibleFiles: resolvedVisibleFiles,
          activeFile: resolvedActiveFile,
          autorun: options?.autorun,
          autoReload: options?.autoReload,
          recompileMode: options?.recompileMode,
          recompileDelay: options?.recompileDelay,
          initMode: options?.initMode,
          initModeObserverOptions: options?.initModeObserverOptions,
          id: options?.id,
          logLevel: options?.logLevel,
          bundlerURL: options?.bundlerURL,
          startRoute: options?.startRoute,
          skipEval: options?.skipEval,
          fileResolver: options?.fileResolver,
          externalResources: options?.externalResources,
          classes: options?.classes,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs={options?.showTabs ?? true}
            showLineNumbers={options?.showLineNumbers ?? true}
            showInlineErrors={options?.showInlineErrors ?? true}
						wrapContent={options?.wrapContent ?? false}
            closableTabs={options?.closableTabs}
            showRunButton={showRunButton}
            initMode={options?.initMode}
            readOnly={options?.readOnly}
            showReadOnly={options?.showReadOnly}
            extensions={options?.codeEditor?.extensions}
            extensionsKeymap={options?.codeEditor?.extensionsKeymap}
            additionalLanguages={options?.codeEditor?.additionalLanguages}
            style={{ height: editorHeight }}
          />
          <SandpackPreview
            showNavigator={options?.showNavigator ?? true}
            showRefreshButton={options?.showRefreshButton ?? true}
            showOpenInCodeSandbox={showOpenInCodeSandbox}
            startRoute={options?.startRoute}
            style={{ height: editorHeight }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};
