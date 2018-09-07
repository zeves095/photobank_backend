<?php

namespace App\PhotoBank\FileUploaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\PhotoBank\FileUploaderBundle\Entity\Upload;
use Symfony\Component\HttpFoundation\RequestStack;

class UploadManagerController extends AbstractController
{
    /**
     * @Route("/check", name="upload_check")
     */
    public function check()
    {
        return $this->render('@FileUploader/test_page/index.html.twig', [
            'controller_name' => 'TestPageController',
        ]);
    }
    /**
     * @Route("/commit", name="upload_commit")
     */
    public function set(RequestStack $requestStack)
    {
      $this->requestStack = $requestStack;

      $upload = new Upload();
      $upload->setUsername($this->request->query->get('username'));
      $upload->setCompleted($this->request->query->get('completed'));
      $upload->setFileHash($this->request->query->get('filehash'));
      $upload->setFilename($this->request->query->get('filename'));
      $upload->setItemId($this->request->query->get('itemId'));

      $this->entityManager->persist($upload);
      $this->entityManager->flush($upload);
    }
    /**
     * @Route("/update", name="upload_update")
     */
    public function update()
    {

    }
}
