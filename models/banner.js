module.exports = function (sequelize, DataTypes) {
  const banner = sequelize.define("Banner", {
    imageUrl: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },

    //이미지를 클릭했을 때 어디로 이동할 것이냐.
    href: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  });
  return banner;
};
