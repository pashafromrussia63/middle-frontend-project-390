install:
	npm install
	npx frontend-flight-booking-server contract

build:
	npm run build

test:
	npm test

mock-api:
	npx @stoplight/prism-cli mock contract/openapi.yaml

start:
	npx frontend-flight-booking-server start -s dist