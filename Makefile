install:
	npm install
	npx frontend-flight-booking-server contract

build:
	npm run build

test:
	npx playwright test tests/smoke.spec.ts

mock-api:
	npx @stoplight/prism-cli mock contract/openapi.yaml