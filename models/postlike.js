module.exports = (sequelize, DataTypes) => {
    const PostLike = sequelize.define('PostLike', {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,  // Ensure this is set to DATE or TIMESTAMP
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'postlikes',  // Ensure you specify the table name
      timestamps: false,  // Since you're manually managing the created_at field
    });
  
    return PostLike;
  };
  