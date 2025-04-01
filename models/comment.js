module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
      comment_id: {
        type: DataTypes.CHAR(36),
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
      });
      Comment.belongsTo(models.Post, {
        foreignKey: 'post_id',
      });
    };
  
    return Comment;
  };
  