const helper = {
  uuidv4: () => {
    return crypto.randomUUID();
  },

  logger: {
    info: (...args: any) => {
      console.log(JSON.stringify(args, getCircularReplacer(), 4), "info logs");
    },
    error: (...args: any) => {
      console.log(JSON.stringify(args, getCircularReplacer(), 4), "error log");
    },
  },

  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  },

  getCookie(cname: string, cookieStr: string) {
    if (!cookieStr) {
      return "";
    }

    let name = cname + "=";
    let ca = cookieStr?.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  getHostFromUrl(url: string) {
    let host = url.split("/")[2];
    return host;
  },
  toSvg(str: string) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(str)}`;
  },
};

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: any, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export default helper;
