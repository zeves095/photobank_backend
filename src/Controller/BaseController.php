<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

use Symfony\Component\HttpFoundation\Response;
use App\Message\ResourcePresetNotification;
use Symfony\Component\Messenger\MessageBusInterface;

class BaseController extends AbstractController
{
    /**
     * @Route("/", name="index")
     */
    public function index()
    {
        return $this->redirectToRoute('upload');
    }

     /**
     * @Route("/test", name="test")
     */
    public function test(MessageBusInterface $bus)
    {
        $bus->dispatch(new ResourcePresetNotification('need new resource preset 200x300'));
        return new Response('<html><body>done</body></html>');
        // return $this->render('test_page/test.html.twig');
    }
}
