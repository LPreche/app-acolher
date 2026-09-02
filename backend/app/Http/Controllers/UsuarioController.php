<?php

namespace App\Http\Controllers;

use App\Http\Requests\SalvarUsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Lista todos os usuários (apenas Administrador).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorizeAdmin($request);

        $query = Usuario::query();

        if ($request->filled('perfil')) {
            $query->where('perfil', $request->perfil);
        }

        if ($request->has('ativo')) {
            $query->where('ativo', filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->where(function ($q) use ($busca) {
                $q->where('nome', 'ilike', "%{$busca}%")
                  ->orWhere('usuario', 'ilike', "%{$busca}%")
                  ->orWhere('email', 'ilike', "%{$busca}%");
            });
        }

        $usuarios = $query->orderBy('nome', 'asc')->get();

        return UsuarioResource::collection($usuarios);
    }

    /**
     * Cadastra um novo usuário no sistema.
     */
    public function store(SalvarUsuarioRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $dados['password'] = Hash::make($dados['password']);
        $dados['ativo'] = $dados['ativo'] ?? true;

        $usuario = Usuario::create($dados);

        AuditoriaService::registrar(
            evento: 'usuario_criado',
            descricao: "Cadastrou o usuário '{$usuario->nome}' (@{$usuario->usuario})",
            usuario: $request->user(),
            dados: ['usuario_id' => $usuario->id, 'perfil' => $usuario->perfil?->value],
            request: $request
        );

        return response()->json([
            'mensagem' => 'Usuário cadastrado com sucesso!',
            'usuario' => new UsuarioResource($usuario),
        ], 201);
    }

    /**
     * Exibe os detalhes de um usuário.
     */
    public function show(Request $request, Usuario $usuario): JsonResponse
    {
        $this->authorizeAdmin($request);

        return response()->json([
            'usuario' => new UsuarioResource($usuario),
        ]);
    }

    /**
     * Atualiza os dados de um usuário existente.
     */
    public function update(SalvarUsuarioRequest $request, Usuario $usuario): JsonResponse
    {
        $dados = $request->validated();

        if (! empty($dados['password'])) {
            $dados['password'] = Hash::make($dados['password']);
        } else {
            unset($dados['password']);
        }

        $usuario->update($dados);

        AuditoriaService::registrar(
            evento: 'usuario_atualizado',
            descricao: "Atualizou dados do usuário '{$usuario->nome}' (@{$usuario->usuario})",
            usuario: $request->user(),
            dados: ['usuario_id' => $usuario->id],
            request: $request
        );

        return response()->json([
            'mensagem' => 'Usuário atualizado com sucesso!',
            'usuario' => new UsuarioResource($usuario),
        ]);
    }

    /**
     * Alterna o status ativo/inativo ou exclui permanentemente o usuário.
     */
    public function destroy(Request $request, Usuario $usuario): JsonResponse
    {
        $this->authorizeAdmin($request);

        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'mensagem' => 'Você não pode inativar ou excluir seu próprio usuário.',
            ], 422);
        }

        if ($request->boolean('permanente')) {
            AuditoriaService::registrar(
                evento: 'usuario_excluido_permanente',
                descricao: "Excluiu permanentemente o usuário '{$usuario->nome}' (@{$usuario->usuario})",
                usuario: $request->user(),
                dados: ['usuario_id' => $usuario->id, 'nome' => $usuario->nome, 'usuario' => $usuario->usuario],
                request: $request
            );

            $usuario->forceDelete();

            return response()->json([
                'mensagem' => 'Usuário excluído permanentemente com sucesso.',
            ]);
        }

        $usuario->ativo = ! $usuario->ativo;
        $usuario->save();

        $statusStr = $usuario->ativo ? 'reativado' : 'inativado';

        AuditoriaService::registrar(
            evento: $usuario->ativo ? 'usuario_reativado' : 'usuario_inativado',
            descricao: "{$statusStr} o usuário '{$usuario->nome}' (@{$usuario->usuario})",
            usuario: $request->user(),
            dados: ['usuario_id' => $usuario->id, 'status' => $usuario->ativo],
            request: $request
        );

        return response()->json([
            'mensagem' => "Usuário {$statusStr} com sucesso!",
            'usuario' => new UsuarioResource($usuario),
        ]);
    }

    private function authorizeAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->eAdmin()) {
            abort(403, 'Acesso não autorizado para esta funcionalidade.');
        }
    }
}
