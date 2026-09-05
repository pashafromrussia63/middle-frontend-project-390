install:
	npm install
	npx frontend-flight-booking-server contract

build:
	npm run build

test:
	APP_URL=http://localhost:4010 npx playwright test tests/smoke.spec.ts