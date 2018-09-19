<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ResourceRepository")
 */
class Resource
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
    private $path;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $username;

    /**
     * @ORM\Column(type="integer")
     */
    private $preset;

    /**
     * @ORM\Column(type="integer")
     */
    private $type = 3;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $chunkPath;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $created_on;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $filename;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $src_filename;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\CatalogueNodeItem", inversedBy="resources")
     * @ORM\JoinColumn(nullable=false)
     */
    private $item;

    /**
     * @ORM\Column(type="boolean", options={"default" = false})
     */
    private $is1c = 0;

    /**
     * @ORM\Column(type="boolean", options={"default" = false})
     */
    private $isDeleted = 0;

    /**
     * @ORM\Column(type="boolean", options={"default" = false})
     */
    private $isDefault = 0;

    /**
     * @ORM\Column(type="integer", options={"default" = 0})
     */
    private $priority = 0;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): self
    {
        $this->path = $path;

        return $this;
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

    public function getPreset(): ?int
    {
        return $this->preset;
    }

    public function setPreset(int $preset): self
    {
        $this->preset = $preset;

        return $this;
    }

    public function getType(): ?int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getChunkPath(): ?string
    {
        return $this->chunkPath;
    }

    public function setChunkPath(?string $chunkPath): self
    {
        $this->chunkPath = $chunkPath;

        return $this;
    }

    public function getCreatedOn(): ?string
    {
        return $this->created_on;
    }

    public function setCreatedOn(string $created_on): self
    {
        $this->created_on = $created_on;

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

    public function getSrcFilename(): ?string
    {
        return $this->src_filename;
    }

    public function setSrcFilename(string $src_filename): self
    {
        $this->src_filename = $src_filename;

        return $this;
    }

    public function getItem(): ?CatalogueNodeItem
    {
        return $this->item;
    }

    public function setItem(?CatalogueNodeItem $item): self
    {
        $this->item = $item;

        return $this;
    }

    public function getIs1c(): ?bool
    {
        return $this->is1c;
    }

    public function setIs1c(bool $is1c): self
    {
        $this->is1c = $is1c;

        return $this;
    }

    public function getIsDeleted(): ?bool
    {
        return $this->isDeleted;
    }

    public function setIsDeleted(bool $isDeleted): self
    {
        $this->isDeleted = $isDeleted;

        return $this;
    }

    public function getIsDefault(): ?bool
    {
        return $this->isDefault;
    }

    public function setIsDefault(bool $isDefault): self
    {
        $this->isDefault = $isDefault;

        return $this;
    }

    public function getPriority(): ?int
    {
        return $this->priority;
    }

    public function setPriority(int $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

}
