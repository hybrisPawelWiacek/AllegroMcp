const https = require('https');

const testSSE = () => {
  const url = 'https://f28d061b-c35a-436c-a99d-2755b228799a-00-1owz4gqnq1vk5.kirk.replit.dev/sse';
  
  console.log('Testing SSE endpoint:', url);
  
  const req = https.get(url, {
    headers: {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    },
    timeout: 10000
  }, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    
    res.on('data', (chunk) => {
      console.log('Received data:', chunk.toString());
    });
    
    res.on('end', () => {
      console.log('Connection ended');
    });
  });
  
  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });
  
  req.on('timeout', () => {
    console.log('Request timeout');
    req.destroy();
  });
  
  setTimeout(() => {
    req.destroy();
    console.log('Test completed');
  }, 8000);
};

testSSE();