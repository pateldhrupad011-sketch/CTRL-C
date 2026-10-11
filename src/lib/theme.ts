export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "ctrlc-theme";
export const DEFAULT_THEME: Theme = "dark";

/** Runs during HTML parsing so the stored theme applies before first paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark")t=${JSON.stringify(
  DEFAULT_THEME,
)};var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t}catch(e){}})()`;

/** Reload always starts at the top, instead of restoring the last scroll position. */
export const reloadFromTopScript = `(function(){try{history.scrollRestoration="manual"}catch(e){}function go(){var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(!n||n.type!=="reload")return;if(location.hash)history.replaceState(null,"",location.pathname+location.search);scrollTo(0,0)}go();addEventListener("pageshow",go);addEventListener("load",go)})()`;
