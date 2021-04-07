<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区 -->
            <div class="avater_box">
                <img src="../assets/logo.png" alt>
            </div>
            <!-- 登录表单区 -->
            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginFormRules"
                label-width="0px"
                class="login_form"
            >
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        prefix-icon="el-icon-lock"
                        type="password"
                    ></el-input>
                </el-form-item>
                <!-- 按钮区 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            // 这是表单的验证规则对象
            loginFormRules: {
                // 验证用户名是否合法,在失去焦点时触发事件
                username: [
                    {
                        required: true,
                        message: '请输入用户名称',
                        trigger: 'blur'
                    },
                    {
                        min: 3,
                        max: 10,
                        message: '长度在 3 到 10 个字符',
                        trigger: 'blur'
                    }
                ],
                // 验证密码是否合法
                password: [
                    {
                        required: true,
                        message: '请输入登录密码',
                        trigger: 'blur'
                    },
                    {
                        min: 6,
                        max: 15,
                        message: '长度在 6 到 15 个字符',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    methods: {
        // 点击重置函数，重置登录表单
        resetLoginForm() {
            // console.log(this)
            this.$refs.loginFormRef.resetFields()
        },
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) return
                // console.log(this)
                const { data: res } = await this.$http.post(
                    'login',
                    this.loginForm
                )
                if (res.meta.status !== 200) {
                    return this.$message.error('登录失败')
                }
                this.$message.success('登录成功')
                /*  1. 将登录成功之后的token，保存到客户端的sessionStorage中
                        1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问到
                        1.2 token只应当在当前网站打开瞬间生效，所以将token保存在sessionStorage中
                    2. 通过编程式导航跳转到后台主页，路由地址是 /home */
                window.sessionStorage.setItem('token', res.data.token)
                this.$router.push('/home')
            })
        }
    }
}
</script>

<style lang='less' scoped>
.login_container {
    background-color: #7aadcace;
    height: 100%;
}
.login_box {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 450px;
    height: 300px;
    background-color: rgba(233, 236, 220, 0.856);
    border-radius: 3px;
    transform: translate(-50%, -50%);
}
// 头像盒子
.avater_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 130px;
    width: 130px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    // 加阴影,向外扩散10像素
    box-shadow: 0 0 10px #ddd;
    img {
        width: 100%;
        height: 100%;

        border-radius: 50%;
        background-color: #eee;
    }
}
.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    // form 表单默认box-sizing: content-box
    box-sizing: border-box;
}
.btns {
    display: flex;
    justify-content: flex-end;
}
</style>
