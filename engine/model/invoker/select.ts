/**
 * @brief Pilih backend via model/router: micro (endpoint local) selalu stub lokal;
 * heavy/light (9router/omp) pakai cloud bila MODEL_API_KEY ada, else stub.
 * @since 0.1.2
 */
import type { TaskKind } from '../router';
import { route } from '../router';
import { CloudModelInvoker } from './cloud';
import { LocalStubInvoker } from './local-stub';
import type { ModelInvoker } from './types';

/**
 * @brief Pilih invoker berdasarkan router config + env.
 * @param {TaskKind} [kind='generate'] - jenis task (route menentukan endpoint).
 * @return {ModelInvoker} invoker aktif.
 * @since 0.1.2
 */
export function selectInvoker(kind: TaskKind = 'generate'): ModelInvoker {
  const backend = route(kind);
  if (backend.endpoint === 'local' || !process.env['MODEL_API_KEY']) {
    return new LocalStubInvoker();
  }
  return new CloudModelInvoker({
    apiKey: process.env['MODEL_API_KEY'],
    baseUrl: process.env['MODEL_BASE_URL'],
    model: process.env['MODEL_NAME'],
  });
}
