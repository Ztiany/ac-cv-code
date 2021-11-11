#include <Windows.h>

//�ص�������wndclass.lpfnWndProc
LRESULT CALLBACK GLWindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
	switch (msg) {
	case WM_CLOSE:
		PostQuitMessage(0);
		return 0;
	}
	return DefWindowProc(hwnd, msg, wParam, lParam);
}

/**Windows �������� Main ����*/
INT WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd) {

	OutputDebugString(L"Window Enter.");

	//step1��ע�ᴰ��
	WNDCLASSEX wndclass;//���ڵ�����
	wndclass.cbClsExtra = 0;
	wndclass.cbSize = sizeof(WNDCLASSEX);
	wndclass.cbWndExtra = 0;
	wndclass.hbrBackground = NULL;
	wndclass.hCursor = LoadCursor(NULL, IDC_ARROW);
	wndclass.hIcon = NULL;
	wndclass.hIconSm = NULL;
	wndclass.hInstance = hInstance;
	wndclass.lpfnWndProc = GLWindowProc;//�¼��ص�������رմ��ڡ�
	wndclass.lpszClassName = L"GLWindow";
	wndclass.lpszMenuName = NULL;
	wndclass.style = CS_VREDRAW | CS_HREDRAW;
	ATOM atom = RegisterClassEx(&wndclass);//ִ��ע��
	if (!atom) {
		MessageBox(NULL, L"Register Fail", L"Error", MB_OK);
		return 0;
	}

	//step2����������
	HWND hwnd = CreateWindowEx(
		NULL,
		//����ע�������� wndclass.lpszClassName ����һ��
		L"GLWindow",
		//������
		L"OpenGL Window", WS_OVERLAPPEDWINDOW,
		//����λ��
		100, 100,
		//���ڴ�С
		800, 600,
		//��������
		NULL, NULL, hInstance, NULL);
	//step3��չʾ����
	ShowWindow(hwnd, SW_SHOW);
	UpdateWindow(hwnd);

	//��ֹ���ڸ��˳�����ʼ�����¼�
	MSG msg;//���ڽ�����Ϣ
	while (true) {
		if (PeekMessage(&msg, NULL, NULL, NULL, PM_REMOVE)) {//������Ϣ
			if (msg.message == WM_QUIT) {
				break;
			}
			//ת����Ϣ�����ַ����Լ�
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
	}

	OutputDebugString(L"Window Exit.");

	return 0;
}