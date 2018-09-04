<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 */
class User
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
     * @ORM\Column(type="string", length=255)
     */
    private $password;

    /**
     * @ORM\Column(type="smallint")
     */
    private $role;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Resource", mappedBy="user")
     */
    private $preset;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Resources", mappedBy="user")
     */
    private $resources;

    public function __construct()
    {
        $this->preset = new ArrayCollection();
        $this->resources = new ArrayCollection();
    }

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

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getRole(): ?int
    {
        return $this->role;
    }

    public function setRole(int $role): self
    {
        $this->role = $role;

        return $this;
    }

    /**
     * @return Collection|Resource[]
     */
    public function getPreset(): Collection
    {
        return $this->preset;
    }

    public function addPreset(Resource $preset): self
    {
        if (!$this->preset->contains($preset)) {
            $this->preset[] = $preset;
            $preset->setUser($this);
        }

        return $this;
    }

    public function removePreset(Resource $preset): self
    {
        if ($this->preset->contains($preset)) {
            $this->preset->removeElement($preset);
            // set the owning side to null (unless already changed)
            if ($preset->getUser() === $this) {
                $preset->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection|Resources[]
     */
    public function getResources(): Collection
    {
        return $this->resources;
    }

    public function addResource(Resources $resource): self
    {
        if (!$this->resources->contains($resource)) {
            $this->resources[] = $resource;
            $resource->setUser($this);
        }

        return $this;
    }

    public function removeResource(Resources $resource): self
    {
        if ($this->resources->contains($resource)) {
            $this->resources->removeElement($resource);
            // set the owning side to null (unless already changed)
            if ($resource->getUser() === $this) {
                $resource->setUser(null);
            }
        }

        return $this;
    }
}
