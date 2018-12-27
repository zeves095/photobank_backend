<?php

namespace App\PhotoBank\FileUploaderBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\PhotoBank\FileUploaderBundle\Repository\UploadRepository")
 */
class Upload
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $username;

    /**
     * @ORM\Column(type="boolean")
     */
    private $completed;

    /**
     * @ORM\Column(type="bigint")
     */
    private $total_chunks;

    /**
     * @ORM\Column(type="bigint")
     */
    private $completed_chunks;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $file_hash;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $filename;

    /**
     * @ORM\Column(type="string", length=11)
     */
    private $item_id;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getCompleted(): ?bool
    {
        return $this->completed;
    }

    public function setCompleted(bool $completed): self
    {
        $this->completed = $completed;

        return $this;
    }

    public function getTotalChunks(): ?int
    {
        return $this->total_chunks;
    }

    public function setTotalChunks(int $total_chunks): self
    {
        $this->total_chunks = $total_chunks;

        return $this;
    }

    public function getCompletedChunks(): ?int
    {
        return $this->completed_chunks;
    }

    public function setCompletedChunks(int $completed_chunks): self
    {
        $this->completed_chunks = $completed_chunks;

        return $this;
    }

    public function getFileHash(): ?string
    {
        return $this->file_hash;
    }

    public function setFileHash(string $file_hash): self
    {
        $this->file_hash = $file_hash;

        return $this;
    }

    public function getFilename(): ?string
    {
        return $this->filename;
    }

    public function setFilename(string $filename): self
    {
        $this->filename = $filename;

        return $this;
    }

    public function getItemId(): ?string
    {
        return $this->item_id;
    }

    public function setItemId(string $item_id): self
    {
        $this->item_id = $item_id;

        return $this;
    }
}
