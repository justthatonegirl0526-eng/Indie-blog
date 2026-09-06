export const BREAKPOINT = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export function getViewport() {
  const width = window.innerWidth;

  if (width <= BREAKPOINT.mobile) {
    return "mobile";
  }

  if (width <= BREAKPOINT.tablet) {
    return "tablet";
  }

  return "desktop";
}

export function isMobile() {
  return window.innerWidth <= BREAKPOINT.mobile;
}

export function isTablet() {
  return window.innerWidth <= BREAKPOINT.tablet;
}
