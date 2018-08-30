<?php

namespace App\Entity;

use App\Entity\Security\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\LinkRepository")
 */
class Link
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
    private $external_url;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $path;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $access;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $target;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Security\User", inversedBy="links")
     * @ORM\JoinColumn(nullable=false)
     */
    private $created_by;

    /**
     * @ORM\Column(type="datetime")
     */
    private $created_on;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $updated_on;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $expires_by;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $comment;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $size_px;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $size_bytes;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $max_requests;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $done_requests;

    /**
     * @ORM\Column(type="boolean")
     */
    private $active;

    /**
     * @ORM\Column(type="boolean")
     */
    private $ready;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $hash;

    /**
     * @ORM\Column(type="boolean")
     */
    private $symlink;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $src_id;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getExternalUrl(): ?string
    {
        return $this->external_url;
    }

    public function setExternalUrl(string $external_url): self
    {
        $this->external_url = $external_url;

        return $this;
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

    public function getAccess(): ?string
    {
        return $this->access;
    }

    public function setAccess(?string $access): self
    {
        $this->access = $access;

        return $this;
    }

    public function getTarget(): ?string
    {
        return $this->target;
    }

    public function setTarget(?string $target): self
    {
        $this->target = $target;

        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->created_by;
    }

    public function setCreatedBy(?User $created_by): self
    {
        $this->created_by = $created_by;

        return $this;
    }

    public function getCreatedOn(): ?\DateTimeInterface
    {
        return $this->created_on;
    }

    public function setCreatedOn(\DateTimeInterface $created_on): self
    {
        $this->created_on = $created_on;

        return $this;
    }

    public function getUpdatedOn(): ?\DateTimeInterface
    {
        return $this->updated_on;
    }

    public function setUpdatedOn(?\DateTimeInterface $updated_on): self
    {
        $this->updated_on = $updated_on;

        return $this;
    }

    public function getExpiresBy(): ?\DateTimeInterface
    {
        return $this->expires_by;
    }

    public function setExpiresBy(?\DateTimeInterface $expires_by): self
    {
        $this->expires_by = $expires_by;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): self
    {
        $this->comment = $comment;

        return $this;
    }

    public function getSizePx(): ?string
    {
        return $this->size_px;
    }

    public function setSizePx(string $size_px): self
    {
        $this->size_px = $size_px;

        return $this;
    }

    public function getSizeBytes(): ?string
    {
        return $this->size_bytes;
    }

    public function setSizeBytes(string $size_bytes): self
    {
        $this->size_bytes = $size_bytes;

        return $this;
    }

    public function getMaxRequests(): ?int
    {
        return $this->max_requests;
    }

    public function setMaxRequests(?int $max_requests): self
    {
        $this->max_requests = $max_requests;

        return $this;
    }

    public function getDoneRequests(): ?int
    {
        return $this->done_requests;
    }

    public function setDoneRequests(int $done_requests): self
    {
        $this->done_requests = $done_requests;

        return $this;
    }

    public function getActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): self
    {
        $this->active = $active;

        return $this;
    }

    public function getReady(): ?bool
    {
        return $this->ready;
    }

    public function setReady(bool $ready): self
    {
        $this->ready = $ready;

        return $this;
    }

    public function getHash(): ?string
    {
        return $this->hash;
    }

    public function setHash(?string $hash): self
    {
        $this->hash = $hash;

        return $this;
    }

    public function getSymlink(): ?bool
    {
        return $this->symlink;
    }

    public function setSymlink(bool $symlink): self
    {
        $this->symlink = $symlink;

        return $this;
    }

    public function getSrcId(): ?int
    {
        return $this->src_id;
    }

    public function setSrcId(?int $src_id): self
    {
        $this->src_id = $src_id;

        return $this;
    }
}
