const https = require('https');

const testEndpoints = [
  'https://f28d061b-c35a-436c-a99d-2755b228799a-00-1owz4gqnq1vk5.kirk.replit.dev/sse',
  'https://f28d061b-c35a-436c-a99d-2755b228799a-00-1owz4gqnq1vk5.kirk.replit.dev/mcp'
];

testEndpoints.forEach((url, index) => {
  setTimeout(() => {
    console.log(`\n--- Testing endpoint ${index + 1}: ${url} ---`);
    
    const req = https.get(url, {
      headers: {
        'Accept': 'text/event-stream',
        'User-Agent': 'AllegroMCP-Test'
      },
      timeout: 5000
    }, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, Object.keys(res.headers).slice(0, 5));
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      
      res.on('end', () => {
        if (data.includes('AllegroMCP') || data.includes('text/event-stream')) {
          console.log('✓ AllegroMCP server detected');
        } else if (data.includes('Run this app')) {
          console.log('✗ Deployment not active - showing placeholder');
        } else {
          console.log('? Unknown response:', data.substring(0, 100));
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`✗ Error: ${err.message}`);
    });
    
    req.on('timeout', () => {
      console.log('✗ Timeout');
      req.destroy();
    });
  }, index * 1000);
});

setTimeout(() => {
  console.log('\n=== Test completed ===');
}, testEndpoints.length * 1000 + 2000);