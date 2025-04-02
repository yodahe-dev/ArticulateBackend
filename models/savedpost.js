module.exports = (sequelize, DataTypes) => {
  const SavedPost = sequelize.define('SavedPost', {
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
  }, {
    tableName: 'savedposts',
    timestamps: false,
  });
  
  return SavedPost;
  };
