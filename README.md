# Webchats

A portfolio-grade social messenger built with Laravel 9, Jetstream/Fortify, Inertia, React, MySQL, Redis, Laravel WebSockets and MinIO object storage.

## Highlights

- Direct realtime chat between friends only.
- Online/offline presence, typing indicators and live conversation previews.
- Smart message scrolling: new messages auto-scroll only when the reader is near the bottom, otherwise a down button appears.
- Text, image, audio, video and document attachments.
- Image preview modal instead of opening images in a new tab.
- Temporary chat media stored in MinIO and pruned after one week.
- Permanent profile photos remain on the public profile-photo disk until replaced.
- Immutable `@handle` registration.
- Email verification through Laravel Fortify.
- SMS verification through a pluggable provider. Local development logs the code; production can use AWS SNS.
- Friend, unfriend, block and report flows.
- Individual profile pages and @handle profile search.
- Dark mode with persisted user preference.
- Docker development stack optimized to avoid high-CPU polling watchers.

## Quick Start

```bash
docker compose up -d --build
```

Open the app at [http://localhost:8080](http://localhost:8080).

MinIO console is available at [http://localhost:9001](http://localhost:9001):

- User: `minioadmin`
- Password: `minioadmin`

## Useful Commands

```bash
docker compose exec app php artisan test
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan attachments:prune-expired
docker compose logs -f app web websockets node
```

## Services

- App: `http://localhost:8080`
- WebSocket server: `localhost:6001`
- MySQL: `localhost:3307`
- Redis: `localhost:6379`
- MinIO API: `localhost:9000`
- MinIO console: `localhost:9001`

## Verification

Email verification is enabled with Fortify. SMS verification defaults to the `log` provider, so local codes are written to Laravel logs. To use AWS SNS, set:

```env
SMS_PROVIDER=sns
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
```

## Performance Notes

The Docker `node` service runs a one-time asset build and then idles. It intentionally does not use `watch-poll`, because polling file watchers are expensive on macOS and were the main source of the high CPU usage.

When actively editing frontend assets, run a watcher manually only while needed:

```bash
docker compose exec node npm run watch
```

## Roadmap

- Group conversation creation and moderation UI.
- WebRTC voice and video calls with TURN/STUN configuration.
- Feed posts, comments, reactions and privacy controls.
- Production queue workers and async media processing.
- CI pipeline and deployment profile.
