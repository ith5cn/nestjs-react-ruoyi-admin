import IP2Region from 'ip2region';
const queryer = new IP2Region();
const ip1 = queryer.search('127.0.0.1');
const ip2 = queryer.search('::1');
console.log('127.0.0.1:', ip1);
console.log('::1:', ip2);
