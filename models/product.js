module.exports = function (sequelize, DataTypes) {
  //테이블을 만들거다. 테이블 이름은 "Product"
  const product = sequelize.define("Product", {
    //Product의 column들을 설정한다.
    name: {
      //name 칼럼의 datatype은 string이고, name의 글자수를 20까지 제한하겠다.
      type: DataTypes.STRING(20),
      //name은 필수항목. Null이 들어갈 수 없다.
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
    },
    seller: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    imageUrl: {
      //파일은 datatype으로 넣지 않는다. 파일은 그 경로를 string 형태로 줌.
      type: DataTypes.STRING(300),
      allowNull: true,
    },
  });
  return product;
};
