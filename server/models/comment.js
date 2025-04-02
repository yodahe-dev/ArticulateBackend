module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    comment_id: {
      type: DataTypes.UUID, // Updated to UUID type
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE', // Optional: Ensures comments are deleted when the associated user is deleted
    });
    Comment.belongsTo(models.Post, {
      foreignKey: 'post_id',
      onDelete: 'CASCADE', // Optional: Ensures comments are deleted when the associated post is deleted
    });
  };

  return Comment;
};
