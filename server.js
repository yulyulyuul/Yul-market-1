const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
//dest를 지정하는 것: 다른 이미지 파일이 오면 어느 파일에 저장할 것이냐 하는 것.
//반환되는 객체를 upload라는 const에 넣겠다.
const upload = multer({
  //storage key에 multer.diskStorage 넣음
  storage: multer.diskStorage({
    //destination의 세 번째 인자인 cb 함수를 받음. "uploads/"라는 폴더에 저장해주겠다는 뜻.
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    //filenamem의 인자인 cb를 받음. file 안에 있는 originalname이라는 값으로 파일 이름을 저장하겠다는 것.
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
const port = 8080;

//app에 대한 설정을 하기 위해 app.use 함.
//express.json: json 형식의 데이터를 처리하겠다.
app.use(express.json());
//모든 브라우저에서 이 서버에 요청할 수 있도록 한다.
app.use(cors());
//404 Not Found는 서버와 통신은 잘 됐는데 서버에서 요청한 정보를 찾을 수 없다는 것. 즉, 파일 경로가 잘못된 것이다.
//실제로 서버에서는 해당 파일들을 우리가 입력했던 경로와는 다른 경로로 보여준다. 우리가 입력한 경로로 보여주라는 것. 404 Not Found를 해결.
//static의 인자로 들어가는 "uploads"는 디렉토리의 이름.
//사용자가 127.0.0.1:3000/uploads/images/cat.jpg로(앞의 "/uploads") 접근한다면
//해당 파일이 uploads/images/cat.jpg에(뒤의 "uploads") 존재하는지를 검색하게 됨.
app.use("/uploads", express.static("uploads"));

//"/products"라는 경로로 method가 get인 요청이 왔을 때 {}안의 코드가 실행된다는 것.
app.get("/products", (req, res) => {
  //쌓여있는 데이터를 모두 조회할 때 findAll()을 사용함. Findall()하고 안에 아무것도 안 넣으면 다 불러옴.
  //모든 데이터를 다 불러오려면 과부하 걸릴 수 있으므로 이것도 조건을 넣는다.
  //limit: 숫자 하면 "숫자" 만큼만 데이터를 불러옴.
  models.Product.findAll({
    limit: 100,
    //정렬 방식을 바꿔줄 때 order을 쓴다.
    //createdAt을 기준으로 내림차순으로 할 때.
    order: [["createdAt", "DESC"]],
    //어떤 column들을 가져올 것이냐. 홈 화면에서 상품들 리스트를 볼 때에는 다 필요하지 않음.
    //모든 칼럼을 보내면 트래픽 낭비의 문제도 있고 예상치 못하게 정보들을 노출시킬 수 있는 가능성 - 보안문제 등 생길 수 있음.
    attributes: ["id", "name", "price", "createdAt", "seller", "imageUrl"],
  })
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
  const { name, description, price, seller, imageUrl } = body;
  //allownull이 false인 것들, 즉 필수입력값들이 입력되지 않은 경우에는
  //아래 models.Product.create에서 오류가 생기고 데이터 생성은 안 됨.
  // ||은 또는 이라는 뜻. 이 중 하나라도 false이면 모든 필드 입력하라는 메세지 뜨게 한 것.
  //이건 방어코드라고 한다. 데이터베이스에 직접 영향을 주는 코드를 짤 때 데이터베이스에 문제가 생기지 않게 하려고 방어코드를 짠다.
  if (!name || !description || !price || !seller || !imageUrl) {
    res.status(400).send("모든 필드를 입력해 주세요.");
  }
  //Product table에 새 데이터를 생성할거다. 괄호 안에 들어 있는 객체로 이루어진 데이터를.
  //데이터베이스에 데이터를 추가하는 것은 오래 걸릴 수 있기 때문에 기본적으로 비동기 처리다. 프로미스 객체임.
  //Postman에서 받아서 create.
  models.Product.create({
    name,
    description,
    price,
    seller,
    imageUrl,
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
      //status를 설정해 주지 않으면 status가 500으로 들어가기 때문에 client 잘못으로 생긴 오류라는 것을 전달하기 위해 status에 400을 넣어 줌.
      res.status(400).send("상품 업로드에 문제가 발생했습니다.");
    });
});

app.get("/products/:id", (req, res) => {
  //params에 {id : 값} 형태로 들어옵니다
  const params = req.params;
  //destructuring 참고. 이렇게 하면 id와 eventId에 params의 key에 대한 value가 들어옴.
  const { id } = params;
  //하나의 data만을 찾고 싶을 때. findAll은 복수개의 데이터 찾을 때.
  //{} 안에 조건문 넣을 수 있음. where도 조건문.
  models.Product.findOne({
    where: {
      //column에서의 id값(앞 id)이 params의 id 값(뒤 id)과 일치할 때.
      id: id,
    },
  })
    .then((result) => {
      console.log("PRODUCT:", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("상품 조회에 에러가 발생했습니다");
    });
});

//'/image': /image로 요청 받았을 때 (http://localhost:8080/image)
//upload.single('image'): 이미지 파일을 하나만 보냈을 때 single 씀
//괄호 안 'image': Image라는 key에 해당하는 value를 upload하는 것. 이처럼 이미지 파일을 업로드 시에는 항상 key가 있어야 함;
//이렇게 하면 uploads라는 폴더에 해당 이미지가 저장이 될 것.
app.post("/image", upload.single("image"), (req, res) => {
  //req.file에 저장된 이미지 정보를 얻을 수 있음.
  //정보에는 file의 이름, original 이름, path, destination, 사이즈(몇 키로바이트인지) 등이 들어감.
  //위 정보 이용해서 용량이 너무 크면 다시 업로드 하라고 할 수 있음.
  const file = req.file;
  console.log(req.file);
  res.send({
    //file.path가 이미지가 저장된 위치임.
    imageUrl: file.path,
    //이렇게 하면 client가 요청했을 시 받은 데이터를 info라고 하면, info.file.response에 이 객체가 담기게 된다.
  });
  //이렇게 하면 multer에서 uploads 파일을 저절로 생성한다. 앞으로 이미지 파일은 여기다 저장될 것.
  //Postman으로 테스트해 볼 수 있다.
});

app.put("/products/:id", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  const params = req.params;
  const { id } = params;
  models.Product.update(
    {
      name: name,
      description: description,
      price: price,
      seller: seller,
      imageUrl: imageUrl,
    },
    {
      where: {
        //column에서의 id값(앞 id)이 params의 id 값(뒤 id)과 일치할 때.
        id: id,
      },
    }
  )
    .then((result) => {
      res.send({
        result,
      });
    })
    .catch((error) => {
      res.status(400).send(`${id}번 상품 조회에 에러가 발생했습니다`);
    });
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
