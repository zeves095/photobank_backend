<?php

namespace App\PhotoBank\FileUploaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use App\PhotoBank\FileUploaderBundle\Service\UploadRecordManager;

class UploadManagerController extends AbstractController
{
    /**
     * @Route("/check", name="upload_check")
     */
    public function check()
    {

    }
    /**
     * @Route("/commit", name="upload_commit")
     */
    public function set(RequestStack $requestStack, UploadRecordManager $recordManager)
    {
      $request = $requestStack->getCurrentRequest();
      $uploads = $request->request->all();
      $recordManager->insert($uploads);
      return new Response();
    }

    /**
     * @Route("/remove", name="upload_remove")
     */
    public function remove(RequestStack $requestStack, UploadRecordManager $recordManager)
    {
      $request = $requestStack->getCurrentRequest();
      $uploads = $request->request->all();
      $recordManager->remove($uploads);
      return new Response();
    }

}
