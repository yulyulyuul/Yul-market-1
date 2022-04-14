const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const port = 8080;

//app에 대한 설정을 하기 위해 app.use 함.
//express.json: json 형식의 데이터를 처리하겠다.
app.use(express.json());
//모든 브라우저에서 이 서버에 요청할 수 있도록 한다.
app.use(cors());

//"/products"라는 경로로 method가 get인 요청이 왔을 때 {}안의 코드가 실행된다는 것.
app.get("/products", (req, res) => {
  //쌓여있는 데이터를 모두 조회할 때
  models.Product.findAll()
    .then((result) => {
      console.log("PRODUCTS:", result);
      res.send({
        products: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("error발생");
    });
});
app.post("/products", (req, res) => {
  //post로 상품 관련된 정보를 바디에 받아온다.
  const body = req.body;
  //body의 정보를 활용, product table에 데이터를 추가해보자.
  const { name, description, price, seller } = body;
  //allownull이 false인 것들, 즉 필수입력값들이 입력되지 않은 경우에는
  //아래 models.Product.create에서 오류가 생기고 데이터 생성은 안 됨.
  // ||은 또는 이라는 뜻. 이 중 하나라도 false이면 모든 필드 입력하라는 메세지 뜨게 한 것.
  //이건 방어코드라고 한다. 데이터베이스에 직접 영향을 주는 코드를 짤 때 데이터베이스에 문제가 생기지 않게 하려고 방어코드를 짠다.
  if (!name || !description || !price || !seller) {
    res.send("모든 필드를 입력해 주세요.");
  }
  //Product table에 새 데이터를 생성할거다. 괄호 안에 들어 있는 객체로 이루어진 데이터를.
  //데이터베이스에 데이터를 추가하는 것은 오래 걸릴 수 있기 때문에 기본적으로 비동기 처리다. 프로미스 객체임.
  //Postman에서 받아서 create.
  models.Product.create({
    name,
    description,
    price,
    seller,
  })
    .then((result) => {
      //데이터 생성에 성공했을 때에는 result에 데이터 생성 결과 record가 들어가게 된다.
      console.log("상품 생성 결과 :", result);
      res.send({
        //key와 value가 같으면 그냥 이렇게 축약 가능.
        result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 업로드에 문제가 발생했습니다.");
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
  //서버가 실행이 되었을 때 데이터베이스를 동기화하는 작업
  //더 정확히는 models에 테이블, 칼럼 등 모델링에 필요한 정보를 넣어놨을 때 이걸 데이터베이스에 동기화시키는 것.
  //예를 들어 models에 상품 관련 테이블을 만들었으면 아래 코드에 의해 데이터베이스에도 그 테이블이 생김.
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB 연결 성공");
    })
    .catch((err) => {
      console.error(err);
      console.log("DB 연결 에러");
      //DB가 연결되지 않으면 API 서버로써 의미가 사라지기 때문에 process를 종료시킨다.
      process.exit();
    });
});
