const http = require('http');

const testSSE = () => {
  const url = 'http://localhost:3000/sse';
  
  console.log('Testing SSE endpoint:', url);
  
  const req = http.get(url, {
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