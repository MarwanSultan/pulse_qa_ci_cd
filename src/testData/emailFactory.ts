import { faker } from '@faker-js/faker';

export function makeUniqueEmail(prefix = 'qa'): string {
  const timestamp = Date.now();
  const domain = faker.internet.domainName().replace(/\./g, '-');
  return `${prefix}.${timestamp}@${domain}.example`;
}

