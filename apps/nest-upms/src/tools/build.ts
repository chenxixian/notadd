import { createProject } from './project'
import { transformClassDeclarationToProto } from './transformClassDeclarationToProto';
import { transformClassDeclarationToGraphql } from './transformClassDeclarationToGraphql';
import { GraphqlCreater } from './graphql'
import fs from 'fs';
export function build(path: string, output: string) {
    const creater = new GraphqlCreater();
    const project = createProject();
    project.addExistingSourceFiles(path)
    const sourceFiles = project.getSourceFiles(path);
    sourceFiles.forEach(file => {
        const classes = file.getClasses();
        // 拿到所有的class
        classes.forEach(cls => {
            const decorators = cls.getDecorators();
            decorators.forEach(dec => {
                const callExp = dec.getCallExpression()
                const expression = callExp.getExpression();
                const text = expression.getText();
                if (text === 'Controller') {
                    // 如果是Controller 解析成proto
                    transformClassDeclarationToProto(cls, file, project)
                } else if (text === 'Resolver') {
                    // 如果是Resolver 解析成graphql
                    transformClassDeclarationToGraphql(cls, file, project, creater)
                    const code = creater.create();
                    fs.writeFileSync(output, code)
                } else {
                    // 不用处理
                }
                return true;
            })
        });
    })
}
