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
        type: DataTypes.DATE,  // Ensure this is set to a valid datatype like DATE or TIMESTAMP
        defaultValue: DataTypes.NOW,  // Automatically sets to current timestamp
      },
    }, {
      tableName: 'savedposts',
      timestamps: false,  // Disable automatic timestamp columns if you're managing them manually
    });
  
    return SavedPost;
  };
  