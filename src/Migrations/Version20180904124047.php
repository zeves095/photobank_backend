<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180904124047 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE resources (id INT NOT NULL, user_id INT DEFAULT NULL, preset_id INT NOT NULL, INDEX IDX_EF66EBAEA76ED395 (user_id), INDEX IDX_EF66EBAE80688E6F (preset_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE item (id INT NOT NULL, cnode_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, code INT NOT NULL, parent_id INT DEFAULT NULL, INDEX IDX_1F1B251EE0273898 (cnode_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE preset (id INT NOT NULL, height INT NOT NULL, width INT NOT NULL, quality INT DEFAULT NULL, crop TINYINT(1) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE cnode (id INT NOT NULL, name VARCHAR(255) NOT NULL, parent_id INT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, role SMALLINT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE resource (id INT NOT NULL, user_id INT DEFAULT NULL, path VARCHAR(100) NOT NULL, preset INT NOT NULL, type INT NOT NULL, group_id INT NOT NULL, item_id INT NOT NULL, created_by INT NOT NULL, INDEX IDX_BC91F416A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE resources ADD CONSTRAINT FK_EF66EBAEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE resources ADD CONSTRAINT FK_EF66EBAE80688E6F FOREIGN KEY (preset_id) REFERENCES preset (id)');
        $this->addSql('ALTER TABLE item ADD CONSTRAINT FK_1F1B251EE0273898 FOREIGN KEY (cnode_id) REFERENCES cnode (id)');
        $this->addSql('ALTER TABLE resource ADD CONSTRAINT FK_BC91F416A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE resources DROP FOREIGN KEY FK_EF66EBAE80688E6F');
        $this->addSql('ALTER TABLE item DROP FOREIGN KEY FK_1F1B251EE0273898');
        $this->addSql('ALTER TABLE resources DROP FOREIGN KEY FK_EF66EBAEA76ED395');
        $this->addSql('ALTER TABLE resource DROP FOREIGN KEY FK_BC91F416A76ED395');
        $this->addSql('DROP TABLE resources');
        $this->addSql('DROP TABLE item');
        $this->addSql('DROP TABLE preset');
        $this->addSql('DROP TABLE cnode');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE resource');
    }
}
