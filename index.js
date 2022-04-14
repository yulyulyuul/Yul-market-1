//파일이 서버 역할을 하도록 도와주는 http 모듈을 가져온다.//
var http = require("http");
var hostname = "127.0.0.1";
var port = 8080;

//서버를 만들어주는 명령어 - 인자가 두 개인 콜백 함수를 만들어줌
//서버에서 요청이 왔을 때 이 createServer가 불려옴. 이 서버에 어떤 요청이 오든 이 콜백함수가 불려온다.
//Client의 요청 정보가 req에 들어가고 응답이 res에 들어감. request, response
const server = http.createServer(function (req, res) {
  const path = req.url;
  const method = req.method;
  if (path === "/products") {
    if (method === "GET") {
      //http response의 head 부분에 어떤 걸 담을지 정해주는 것.
      //정상적으로 요청되었을 때 200이 뜨도록 하고 객체를 하나 뜨도록 함.
      //Content-Type을 정하는 것: json 형식의 응답을 보낼거라고 지정.
      res.writeHead(200, { "Content-Type": "application/json" });
      //end 함수의 첫 번째 인자로는 스트링이 들어가야 함. 그래서 JSON.stringify로 javascript를 string으로 바꿔준 것
      //end를 통해 string을 반환해줌.
      const products = JSON.stringify([
        {
          name: "농구공",
          price: 5000,
        },
      ]);
      res.end(products);
    } else if (method === "POST") {
      res.end("생성되었습니다");
    }
  }
  res.end("Good Bye");
});

//listen은 개발자 용어로 기다리고 있다는 뜻이다.
//아래처럼 쓰면 해당 port번호와 hostname으로 요청을 기다리고 있겠다는 뜻.
server.listen(port, hostname);

console.log("grab market server on");
