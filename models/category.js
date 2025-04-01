module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      category_id: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    }, {
      tableName: 'categories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  
    Category.associate = (models) => {
      Category.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
      Category.hasMany(models.Post, {
        foreignKey: 'category_id',
      });
    };
  
    return Category;
  };
  