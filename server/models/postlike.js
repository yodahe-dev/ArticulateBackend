module.exports = (sequelize, DataTypes) => {
  const PostLike = sequelize.define(
    'PostLike',
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'postlikes',
      timestamps: false,
    }
  );

  PostLike.associate = (models) => {
    PostLike.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    PostLike.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
  };

  return PostLike;
};
