import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '20s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'], // 95% under 1.5s for this smoke run
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://www.fedramp.gov/';

export default function () {
  const res = http.get(`${BASE_URL}`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'TTFB under 800ms': (r) => r.timings.waiting < 800,
  });
  sleep(1);
}

