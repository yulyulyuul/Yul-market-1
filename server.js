const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;

//app에 대한 설정을 하기 위해 app.use 함.
//express.json: json 형식의 데이터를 처리하겠다.
app.use(express.json());
//모든 브라우저에서 이 서버에 요청할 수 있도록 한다.
app.use(cors());

//"/products"라는 경로로 method가 get인 요청이 왔을 때 {}안의 코드가 실행된다는 것.
app.get("/products", (req, res) => {
  const query = req.query;
  console.log("QUERY:", query);
  res.send({
    products: [
      {
        id: 1,
        name: "농구공",
        price: 100000,
        seller: "조던",
        imageUrl: "images/products/basketball1.jpeg",
      },
      {
        id: 2,
        name: "축구공",
        price: 50000,
        seller: "메시",
        imageUrl: "images/products/soccerball1.jpg",
      },
      {
        id: 3,
        name: "키보드",
        price: 10000,
        seller: "그랩",
        imageUrl: "images/products/keyboard1.jpg",
      },
    ],
  });
});
app.post("/products", (req, res) => {
  const body = req.body;
  res.send({
    //key와 value가 똑같은 경우는 생략이 가능하다. body: body 에서 body로 생략 가능.
    body,
  });
});

app.get("/products/:id/events/:eventId", (req, res) => {
  //params에 {id : 값} 형태로 들어옵니다
  const params = req.params;
  //destructuring 참고. 이렇게 하면 id와 eventId에 params의 key에 대한 value가 들어옴.
  const { id, eventId } = params;
  res.send(`id는 ${id}, evnetId는 ${eventId}입니다`);
});

app.listen(port, () => {
  console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다.");
});
