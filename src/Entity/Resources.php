<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ResourcesRepository")
 */
class Resources
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue(strategy="SEQUENCE")
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="resources")
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Preset", inversedBy="resources")
     * @ORM\JoinColumn(nullable=false)
     */
    private $preset;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getPreset(): ?Preset
    {
        return $this->preset;
    }

    public function setPreset(?Preset $preset): self
    {
        $this->preset = $preset;

        return $this;
    }
}
