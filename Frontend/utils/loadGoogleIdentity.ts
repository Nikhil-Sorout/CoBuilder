// Production-Safe GIS Loader (Dynamic Injection)
export function loadGoogleIdentity(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity failed to load"));

    document.head.appendChild(script);
  });
}
