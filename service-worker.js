const CACHE_NAME = "kineto-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/animations.css",
  "./css/responsive.css",
  "./js/app.js",
  "./js/router.js",
  "./js/storage.js",
  "./js/utils.js",
  "./js/i18n.js",
  "./js/data/exercises.js",
  "./js/data/programs.js",
  "./js/data/achievements.js",
  "./js/components/navigation.js",
  "./js/components/exerciseCard.js",
  "./js/components/progressRing.js",
  "./js/components/calendar.js",
  "./js/components/timer.js",
  "./js/components/exerciseMedia.js",
  "./js/services/workoutEngine.js",
  "./js/services/xpSystem.js",
  "./js/services/streakSystem.js",
  "./js/services/recommendations.js",
  "./js/services/qrTransfer.js",
  "./js/vendor/qrcode-generator.js",
  "./js/vendor/qrcode-adapter.js",
  "./js/vendor/jsQR.min.js",
  "./js/pages/home.js",
  "./js/pages/train.js",
  "./js/pages/workout.js",
  "./js/pages/progress.js",
  "./js/pages/achievements.js",
  "./js/pages/profile.js",
  "./assets/icons/icon.svg",
  "./assets/illustrations/chest.svg",
  "./assets/illustrations/back.svg",
  "./assets/illustrations/shoulders.svg",
  "./assets/illustrations/arms.svg",
  "./assets/illustrations/core.svg",
  "./assets/illustrations/legs.svg",
  "./assets/illustrations/full-body.svg",
  "./assets/illustrations/mobility.svg",
  "./assets/images/abdominal.png",
  "./assets/images/back.png",
  "./assets/images/chest.png",
  "./assets/images/shoulder.png",
  "./assets/images/thigh.png",
  "./assets/exercises/media-manifest.json",
  "./assets/exercises/shoulders/pike-push-up-thumb.png",
  "./assets/exercises/core/crunch.png",
  "./assets/exercises/core/crunch-thumb.png",
  "./assets/exercises/core/plank.png",
  "./assets/exercises/core/plank-thumb.png",
  "./assets/exercises/legs/reverse-lunge.jfif",
  "./assets/exercises/legs/reverse-lunge-thumb.jpg",
  "./assets/exercises/back/pull-up.jpg",
  "./assets/exercises/back/pull-up-thumb.jpg",
  "./assets/exercises/core/leg-raise.png",
  "./assets/exercises/core/leg-raise-thumb.png",
  "./assets/exercises/mobility/hip-flexor-stretch-thumb.png"
];

const OPTIONAL_REMOTE = [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL).then(() => Promise.allSettled(OPTIONAL_REMOTE.map((url) => cache.add(url)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
