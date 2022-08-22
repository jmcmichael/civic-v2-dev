// to be based on: https://github.com/stefanoslig/xstate-angular/blob/main/apps/conduit/src/app/article-list/%2Bxstate/article-list-machine.facade.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EvidenceItemStateFacade {
  // private state$ = this.articleListMachineService.articleListMachine.state$;
  // send = this.articleListMachineService.articleListMachine.send;
  // articles$: Observable<Article[]> = this.state$.pipe(
  //   map((state) => state.context.articles)
  // );
  // constructor(private articleListMachineService: ArticleListMachineService) {}

  // loadArticles(tabType: string, tag: string) {
  //   this.send(new GetArticles({ tabType, tag }));
  // }
  // favorite(slug: string) {}
  // unFavorite(slug: string) {}
  // setPage(page: number) {}
}
