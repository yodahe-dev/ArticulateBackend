module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    post_id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',  // Ensure the database column uses snake_case
    updatedAt: 'updated_at',  // Same here
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: 'user_id' });
    Post.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'  // Alias correctly mapped here
    });
    Post.hasMany(models.Comment, { foreignKey: 'post_id' });
    Post.hasMany(models.PostLike, { foreignKey: 'post_id' });
    Post.hasMany(models.SavedPost, { foreignKey: 'post_id' });
  };
  
  return Post;
};
